import { ArticleForm } from '@/components/admin/ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#E8F5EE]">Nouvel article</h1>
        <p className="text-[#9DC4AD] text-sm">Créer un nouvel article ou annonce</p>
      </div>
      <ArticleForm />
    </div>
  )
}
