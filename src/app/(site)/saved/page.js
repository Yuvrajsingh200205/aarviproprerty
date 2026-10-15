import SavedProjects from '@/components/site/SavedProjects';

export const metadata = { title: 'Saved Projects' };

export default function SavedPage() {
  return (
    <>
      <section className="bg-brand-900 py-10 text-white md:py-14">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl">Saved Projects</h1>
          <p className="mt-2 text-white/80">Projects you have marked with the heart. They are stored in this browser.</p>
        </div>
      </section>
      <div className="container py-10">
        <SavedProjects />
      </div>
    </>
  );
}
