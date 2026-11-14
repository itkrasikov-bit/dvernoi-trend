import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { posts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Блог о дверях',
  description: 'Как выбрать дверь, чем отличается скрытый монтаж, зачем нужен замер — статьи и советы.',
};

export default function BlogPage() {
  return (
    <div className="container-x py-12">
      <p className="eyebrow">Блог</p>
      <h1 className="mt-3 text-[36px] text-forest sm:text-[46px]">Полезное о дверях</h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-ink/70">
        Короткие статьи без воды: как выбрать, на что смотреть и как не переплатить.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="card group overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden bg-white">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-xs text-muted">
                {formatDate(post.date)} · {post.reading}
              </p>
              <h2 className="mt-2 text-xl leading-snug text-forest">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <p className="mt-4 text-sm font-semibold text-brass">Читать →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
