const ArticlePreview = ({ title, category, summary, isFeatured }: {
  title: string;
  category: string;
  summary: string;
  isFeatured?: boolean;
}) => {
  return (
    <article className="flex flex-col gap-3">
      <h3 className="text-h3-color font-heading text-base font-medium uppercase leading-[22px]">
        {isFeatured ? "NAME OF THE FEATURED ARTICLE" : "NAME OF THE LATEST ARTICLE"}
      </h3>
      <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">
        Blog thumbnail
      </div>
      <div className="flex justify-between items-center">
        <span className="text-main-accent font-sans text-sm uppercase">{category}</span>
        <a href="#" className="text-main-accent font-sans text-sm hover:underline">View all</a>
      </div>
      <h4 className="text-main-accent font-heading text-lg font-medium uppercase">
        {/* This heading seems to be missing in the mockup for the second article preview, but present for the first. Assuming it should be dynamic or potentially omitted for non-featured. For now, using the provided title prop. */}
        {title}
      </h4>
      <p className="text-foreground font-sans text-base leading-5">
        {summary}
      </p>
    </article>
  );
};

const BlogSection = () => {
  return (
    <section className="w-full bg-secondary-accent px-6 py-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-heading text-xl font-medium uppercase leading-6">
          DOG BODY MIND BLOG
        </h2>
        {/* Placeholder for blog icon, using a simple SVG for now */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V18m12.75-3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      </div>

      <ArticlePreview
        isFeatured
        title="NAME OF THE FEATURED ARTICLE" // Mockup shows this twice, once above thumbnail, once below category
        category="BLOG CATEGORY"
        summary="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem."
      />

      <ArticlePreview
        title="NAME OF THE LATEST ARTICLE" // Mockup implies this title is different from the one above thumbnail
        category="BLOG CATEGORY"
        summary="Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
      />
    </section>
  );
};

export default BlogSection; 