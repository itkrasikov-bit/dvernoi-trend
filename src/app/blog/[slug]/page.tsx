import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeadButton } from '@/components/LeadButton';
import { getPost, posts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Статья не найдена' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="container-x py-10">
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link href="/blog" className="hover:text-forest">
          Блог
        </Link>
        <span>/</span>
        <span className="text-ink">{post.title}</span>
      </nav>

      <header className="mt-5 max-w-[760px]">
        <p className="text-xs text-muted">
          {formatDate(post.date)} · {post.reading}
        </p>
        <h1 className="mt-3 text-[34px] leading-tight text-forest sm:text-[42px]">{post.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{post.excerpt}</p>
      </header>

      <div className="relative mt-8 aspect-[16/9] max-w-[900px] overflow-hidden rounded-[1.2rem]">
        <Image src={post.image} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
      </div>

      <div className="prose-custom mt-8 max-w-[720px]">
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 max-w-[720px] rounded-2xl bg-brass/12 p-6">
        <p className="font-display text-xl text-forest">Остались вопросы по двери?</p>
        <p className="mt-1 text-sm text-ink/70">Приедем на замер и подберём модель под ваш проём.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LeadButton className="btn btn-primary" type="measure">
            Вызвать замерщика
          </LeadButton>
          <Link href="/catalog" className="btn btn-ghost">
            Смотреть каталог
          </Link>
        </div>
      </div>
    </article>
  );
}
