
import { promises as fs } from 'fs';
import path from 'path';

export default async function TechStackPage() {
  const htmlPath = path.join(process.cwd(), 'public', 'tech-stack', 'tech_stack.html');
  const htmlContent = await fs.readFile(htmlPath, 'utf-8');

  return (
    <div className="w-full h-screen">
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        title="Tech Stack Visualization"
      />
    </div>
  );
}
