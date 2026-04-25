
export default function TechStackPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/api/tech-stack"
        className="w-full h-full border-0"
        title="Tech Stack Visualization"
      />
    </div>
  );
}
