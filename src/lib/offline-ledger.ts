import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OfflineRecord {
    id: string; // uuid
    event_id: string;
    participant_id: string;
    action: "attended" | "registered" | "cancelled";
    recorded_by: string;
    recorded_at: string;
    metadata?: Record<string, any>;

    // Immutability Fields
    hash: string;
    previous_hash: string;

    // Sync Status
    synced: boolean;
    sync_error?: string;
}

const STORAGE_KEY = "snovaa_ledger_queue";

export class OfflineLedger {
    /**
     * Generates a SHA-256 hash for the record to ensure integrity.
     * This creates a "Usage Chain" where each record is cryptographically linked to the previous one.
     */
    private static async generateHash(
        record: Omit<OfflineRecord, "hash">
    ): Promise<string> {
        const data = `${record.previous_hash}|${record.event_id}|${record.participant_id}|${record.recorded_at}|${record.action}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Retrieves the local queue from Offline Storage
     */
    static getQueue(): OfflineRecord[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to read ledger queue", e);
            return [];
        }
    }

    /**
     * Get the latest hash to link the next record.
     */
    private static getLatestHash(): string {
        const queue = this.getQueue();
        if (queue.length > 0) {
            return queue[queue.length - 1].hash;
        }
        // Genesis hash for this device's chain
        return "0000000000000000000000000000000000000000000000000000000000000000";
    }

    /**
     * PRIMARY ACTION: Record a check-in locally (Offline First)
     */
    static async addRecord(
        eventId: string,
        participantId: string,
        recordedBy: string,
        action: "attended" = "attended"
    ): Promise<OfflineRecord> {
        const queue = this.getQueue();
        const previousHash = this.getLatestHash();
        const now = new Date().toISOString();

        const partialRecord = {
            id: crypto.randomUUID(),
            event_id: eventId,
            participant_id: participantId,
            action,
            recorded_by: recordedBy,
            recorded_at: now,
            previous_hash: previousHash,
            synced: false,
        };

        const hash = await this.generateHash(partialRecord);
        const fullRecord: OfflineRecord = { ...partialRecord, hash };

        // Optimistic Update: Add to queue
        queue.push(fullRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        // Try to sync immediately if online (Background)
        if (navigator.onLine) {
            this.syncPendingRecords();
        }

        return fullRecord;
    }

    /**
     * Sychronizes pending records to the Supabase Cloud.
     * This is idempotent and can be called safely multiple times.
     */
    static async syncPendingRecords(): Promise<{ synced: number; errors: number }> {
        if (!navigator.onLine) return { synced: 0, errors: 0 };

        const queue = this.getQueue();
        const pending = queue.filter((r) => !r.synced);

        if (pending.length === 0) return { synced: 0, errors: 0 };

        let successCount = 0;
        let errorCount = 0;

        // Process sequentially to maintain order (critical for ledger)
        for (const record of pending) {
            try {
                const { error } = await supabase.from("participation_ledger").insert({
                    event_id: record.event_id,
                    participant_id: record.participant_id,
                    action: record.action,
                    recorded_by: record.recorded_by,
                    recorded_at: record.recorded_at,
                    // Store hash/integrity data in metadata since schema might not have specific cols yet
                    metadata: {
                        hash: record.hash,
                        previous_hash: record.previous_hash,
                        offline_id: record.id,
                        sync_timestamp: new Date().toISOString()
                    }
                });

                if (error) throw error;

                // Mark as synced locally
                record.synced = true;
                record.sync_error = undefined;
                successCount++;

            } catch (err: any) {
                console.error("Sync failed for record", record.id, err);
                record.sync_error = err.message || "Unknown sync error";
                errorCount++;

                // If it's a "duplicate" error, we might want to mark it synced to clear queue
                if (err.code === '23505') { // Unique violation
                    record.synced = true;
                    record.sync_error = "Already exists on server";
                }
            }
        }

        // Save updated queue state
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        // Cleanup: Optional - Remove synced records older than 24h to save space
        // For now, we keep them for history

        if (successCount > 0) {
            toast.success(`Synced ${successCount} offline records`);
        }

        return { synced: successCount, errors: errorCount };
    }

    /**
     * Returns stats for UI
     */
    static getStats() {
        const queue = this.getQueue();
        return {
            total: queue.length,
            pending: queue.filter(r => !r.synced).length,
            synced: queue.filter(r => r.synced).length,
            lastHash: this.getLatestHash()
        };
    }
}
