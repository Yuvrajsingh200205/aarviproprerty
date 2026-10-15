// Field + column definitions for the admin panel. Names map 1:1 to backend model paths.
import { Badge } from '@/components/admin/ui';
import { media } from './utils';

export const PROJECT_TYPES = ['New Launch', 'Rental', 'Resale'];

const thumb = (src) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media(src)} alt="" className="h-10 w-14 rounded object-cover" />
  ) : (
    <span className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">—</span>
  );

export const projectSections = [
  {
    title: 'Basic information',
    fields: [
      { name: 'name', label: 'Project name', type: 'text', required: true, span: 2 },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to generate from the name.' },
      { name: 'category', label: 'Property category', type: 'ref', endpoint: 'categories', required: true },
      { name: 'projectType', label: 'Project type', type: 'select', options: PROJECT_TYPES },
      { name: 'location', label: 'Location', type: 'ref', endpoint: 'locations' },
      { name: 'developer', label: 'Developer', type: 'ref', endpoint: 'developers' },
      { name: 'sector', label: 'Sector / locality', type: 'text', placeholder: 'e.g. Sector 63A' },
      { name: 'address', label: 'Full address', type: 'text' },
      { name: 'reraNo', label: 'RERA number', type: 'text' },
      { name: 'status', label: 'Status', type: 'text', placeholder: 'e.g. Under Construction' },
      { name: 'possession', label: 'Possession', type: 'text', placeholder: 'e.g. Dec 2028' },
    ],
  },
  {
    title: 'Configuration & pricing',
    fields: [
      { name: 'configuration', label: 'Configuration', type: 'text', placeholder: '3/4/5 BHK' },
      { name: 'size', label: 'Project size', type: 'text', placeholder: '2150 - 3900 Sqft' },
      { name: 'priceLabel', label: 'Price', type: 'text', placeholder: 'On Request, 3.5 Cr onwards…' },
    ],
  },
  {
    title: 'Content',
    fields: [
      { name: 'shortDescription', label: 'Short description', type: 'textarea', rows: 3 },
      { name: 'overview', label: 'Overview (Markdown)', type: 'markdown', rows: 12 },
      { name: 'highlights', label: 'Highlights', type: 'tags', placeholder: 'Add highlight and press Enter' },
      { name: 'amenities', label: 'Amenities', type: 'tags', placeholder: 'Add amenity and press Enter' },
      {
        name: 'landmarks',
        label: 'Nearby landmarks',
        type: 'list',
        addLabel: 'Add landmark',
        itemFields: [
          { name: 'name', label: 'Name', placeholder: 'Metro station' },
          { name: 'distance', label: 'Distance', placeholder: '2 km' },
        ],
      },
      {
        name: 'faqs',
        label: 'FAQs',
        type: 'list',
        addLabel: 'Add FAQ',
        itemFields: [
          { name: 'question', label: 'Question' },
          { name: 'answer', label: 'Answer', type: 'textarea' },
        ],
      },
    ],
  },
  {
    title: 'Media',
    fields: [
      { name: 'heroImage', label: 'Main image', type: 'image' },
      { name: 'brochure', label: 'Brochure (PDF)', type: 'file' },
      { name: 'sitePlan', label: 'Site plan image', type: 'image' },
      { name: 'gallery', label: 'Gallery images', type: 'images' },
      {
        name: 'floorPlans',
        label: 'Floor plans',
        type: 'list',
        addLabel: 'Add floor plan',
        itemFields: [
          { name: 'title', label: 'Title', placeholder: '3 BHK – 1850 sqft' },
          { name: 'image', label: 'Image', type: 'image' },
        ],
      },
      { name: 'videoUrl', label: 'Video URL', type: 'url', placeholder: 'https://youtube.com/…' },
      { name: 'mapUrl', label: 'Google Maps link', type: 'url' },
    ],
  },
  {
    title: 'Visibility & SEO',
    fields: [
      { name: 'published', label: 'Published', type: 'checkbox', checkboxLabel: 'Published (visible on website)' },
      { name: 'isNewLaunch', label: 'New launch', type: 'checkbox', checkboxLabel: 'Show in “New Launched Properties” on home page' },
      { name: 'isFeatured', label: 'Featured', type: 'checkbox', checkboxLabel: 'Featured (shown first in its category)' },
      { name: 'order', label: 'Sort order', type: 'number', help: 'Lower numbers appear first.' },
      { name: 'seoTitle', label: 'SEO title', type: 'text' },
      { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 2 },
    ],
  },
];

export const projectDefaults = {
  projectType: 'New Launch',
  priceLabel: 'On Request',
  published: true,
  isNewLaunch: false,
  isFeatured: false,
  order: 0,
  amenities: [],
  highlights: [],
  landmarks: [],
  faqs: [],
  gallery: [],
  floorPlans: [],
};

export const resources = {
  categories: {
    title: 'Categories',
    subtitle: 'Property categories shown in menus, filters and on the home page.',
    endpoint: 'categories',
    itemName: 'category',
    defaults: { showInMenu: true, order: 0 },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Used in /projects?property=slug' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'order', label: 'Sort order', type: 'number' },
      { name: 'showInMenu', label: 'Show in menu', type: 'checkbox', checkboxLabel: 'Show in navigation & home page' },
      { name: 'seoTitle', label: 'SEO title', type: 'text' },
      { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 2 },
    ],
    columns: [
      { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'slug', label: 'Slug' },
      { key: 'order', label: 'Order' },
      { key: 'showInMenu', label: 'In menu', render: (r) => <Badge color={r.showInMenu ? 'green' : 'slate'}>{r.showInMenu ? 'Yes' : 'No'}</Badge> },
    ],
  },
  locations: {
    title: 'Locations',
    subtitle: 'Micro-markets used in filters and the home page “Locations” section.',
    endpoint: 'locations',
    itemName: 'location',
    defaults: { city: 'Gurugram', showOnHome: true, order: 0 },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'order', label: 'Sort order', type: 'number' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'showOnHome', label: 'Show on home', type: 'checkbox', checkboxLabel: 'Show on home page' },
    ],
    columns: [
      { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'city', label: 'City' },
      { key: 'slug', label: 'Slug' },
      { key: 'showOnHome', label: 'On home', render: (r) => <Badge color={r.showOnHome ? 'green' : 'slate'}>{r.showOnHome ? 'Yes' : 'No'}</Badge> },
    ],
  },
  developers: {
    title: 'Developers',
    subtitle: 'Builders and developers whose projects you list.',
    endpoint: 'developers',
    itemName: 'developer',
    defaults: { published: true, showOnHome: true, order: 0 },
    wide: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'order', label: 'Sort order', type: 'number' },
      { name: 'description', label: 'Description (Markdown)', type: 'markdown', rows: 6 },
      { name: 'published', label: 'Published', type: 'checkbox', checkboxLabel: 'Published' },
      { name: 'showOnHome', label: 'On home', type: 'checkbox', checkboxLabel: 'Show on home page' },
    ],
    columns: [
      { key: 'logo', label: '', render: (r) => thumb(r.logo) },
      { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'slug', label: 'Slug' },
      { key: 'published', label: 'Status', render: (r) => <Badge color={r.published ? 'green' : 'slate'}>{r.published ? 'Published' : 'Hidden'}</Badge> },
    ],
  },
  blogs: {
    title: 'Blogs',
    subtitle: 'Articles shown on the Blogs page.',
    endpoint: 'blogs',
    itemName: 'post',
    wide: true,
    defaults: { published: true, author: 'Aarvi Property', tags: [] },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'publishedAt', label: 'Publish date', type: 'datetime', help: 'Future dates stay hidden until then.' },
      { name: 'image', label: 'Cover image', type: 'image' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
      { name: 'content', label: 'Content (Markdown)', type: 'markdown', rows: 14 },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'published', label: 'Published', type: 'checkbox', checkboxLabel: 'Published' },
      { name: 'seoTitle', label: 'SEO title', type: 'text' },
      { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 2 },
    ],
    columns: [
      { key: 'image', label: '', render: (r) => thumb(r.image) },
      { key: 'title', label: 'Title', render: (r) => <span className="font-semibold">{r.title}</span> },
      { key: 'publishedAt', label: 'Date', render: (r) => new Date(r.publishedAt).toLocaleDateString('en-IN') },
      { key: 'published', label: 'Status', render: (r) => <Badge color={r.published ? 'green' : 'slate'}>{r.published ? 'Published' : 'Draft'}</Badge> },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    subtitle: 'Customer reviews shown on the home page.',
    endpoint: 'testimonials',
    itemName: 'testimonial',
    defaults: { published: true, rating: 5, order: 0 },
    fields: [
      { name: 'name', label: 'Customer name', type: 'text', required: true },
      { name: 'designation', label: 'Designation / city', type: 'text' },
      { name: 'text', label: 'Review', type: 'textarea', rows: 4, required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'link', label: 'Review link', type: 'url' },
      { name: 'order', label: 'Sort order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox', checkboxLabel: 'Published' },
    ],
    columns: [
      { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'text', label: 'Review', render: (r) => <span className="line-clamp-2 max-w-md text-slate-600">{r.text}</span> },
      { key: 'rating', label: 'Rating' },
      { key: 'published', label: 'Status', render: (r) => <Badge color={r.published ? 'green' : 'slate'}>{r.published ? 'Published' : 'Hidden'}</Badge> },
    ],
  },
  awards: {
    title: 'Awards',
    subtitle: 'Awards & recognitions shown on the home page.',
    endpoint: 'awards',
    itemName: 'award',
    defaults: { published: true, order: 0 },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'order', label: 'Sort order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox', checkboxLabel: 'Published' },
    ],
    columns: [
      { key: 'image', label: '', render: (r) => thumb(r.image) },
      { key: 'title', label: 'Title', render: (r) => <span className="font-semibold">{r.title}</span> },
      { key: 'year', label: 'Year' },
      { key: 'published', label: 'Status', render: (r) => <Badge color={r.published ? 'green' : 'slate'}>{r.published ? 'Published' : 'Hidden'}</Badge> },
    ],
  },
};

export const settingsTabs = [
  {
    id: 'general',
    label: 'General & Contact',
    fields: [
      { name: 'siteName', label: 'Site name', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'favicon', label: 'Favicon', type: 'image' },
      { name: 'phones', label: 'Phone numbers', type: 'tags', placeholder: '+91-9999999999 (Enter to add)' },
      { name: 'whatsapp', label: 'WhatsApp number', type: 'text', help: 'Digits with country code, e.g. 919999999999' },
      { name: 'emails', label: 'Email addresses', type: 'tags' },
      { name: 'address', label: 'Office address', type: 'textarea', rows: 2 },
      { name: 'mapLink', label: 'Google Maps link', type: 'url' },
      { name: 'mapEmbed', label: 'Google Maps embed URL', type: 'url', help: 'Must start with https://www.google.com/maps/embed' },
      { name: 'workingHours', label: 'Working hours', type: 'text' },
      { name: 'reraNo', label: 'Agent RERA number', type: 'text' },
      { name: 'footerText', label: 'Footer text', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'home',
    label: 'Home page',
    fields: [
      { name: 'hero.title', label: 'Hero title', type: 'text', span: 2 },
      { name: 'hero.subtitle', label: 'Hero subtitle', type: 'textarea', rows: 2 },
      { name: 'hero.image', label: 'Hero background image', type: 'image' },
      {
        name: 'stats',
        label: 'Statistics band',
        type: 'list',
        addLabel: 'Add statistic',
        itemFields: [
          { name: 'value', label: 'Value', placeholder: '500+' },
          { name: 'label', label: 'Label', placeholder: 'Properties sold' },
        ],
      },
      { name: 'sectionTitles.newLaunch', label: 'New launches heading', type: 'text' },
      { name: 'sectionTitles.residential', label: 'Residential heading', type: 'text' },
      { name: 'sectionTitles.commercial', label: 'Commercial heading', type: 'text' },
      { name: 'sectionTitles.plots', label: 'Plots heading', type: 'text' },
      { name: 'sectionTitles.locations', label: 'Locations heading', type: 'text' },
      { name: 'sectionTitles.awards', label: 'Awards heading', type: 'text' },
      { name: 'sectionTitles.testimonials', label: 'Testimonials heading', type: 'text' },
      { name: 'sectionTitles.developers', label: 'Developers heading', type: 'text' },
    ],
  },
  {
    id: 'social',
    label: 'Social links',
    fields: [
      { name: 'social.facebook', label: 'Facebook', type: 'url' },
      { name: 'social.instagram', label: 'Instagram', type: 'url' },
      { name: 'social.linkedin', label: 'LinkedIn', type: 'url' },
      { name: 'social.twitter', label: 'X / Twitter', type: 'url' },
      { name: 'social.youtube', label: 'YouTube', type: 'url' },
    ],
  },
  {
    id: 'about',
    label: 'About page',
    fields: [
      { name: 'about.heading', label: 'Heading', type: 'text' },
      { name: 'about.intro', label: 'Intro', type: 'textarea', rows: 3 },
      { name: 'about.image', label: 'Image', type: 'image' },
      { name: 'about.mission', label: 'Mission', type: 'textarea', rows: 4 },
      { name: 'about.vision', label: 'Vision', type: 'textarea', rows: 4 },
      { name: 'about.body', label: 'Body (Markdown)', type: 'markdown', rows: 10 },
    ],
  },
  {
    id: 'legal',
    label: 'Legal pages',
    fields: [
      { name: 'privacyPolicy', label: 'Privacy policy (Markdown)', type: 'markdown', rows: 12 },
      { name: 'terms', label: 'Terms & conditions (Markdown)', type: 'markdown', rows: 12 },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    fields: [
      { name: 'seoTitle', label: 'Default page title', type: 'text' },
      { name: 'seoDescription', label: 'Default meta description', type: 'textarea', rows: 3 },
    ],
  },
];
