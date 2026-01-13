interface PrincipleBlockProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const PrincipleBlock = ({ icon, title, description }: PrincipleBlockProps) => {
  return (
    <div className="space-y-3">
      <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-medium text-display">{title}</h3>
      <p className="text-body leading-relaxed">{description}</p>
    </div>
  );
};
