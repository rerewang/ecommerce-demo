import { Hero } from "@/components/home/Hero"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"
import { StyleCategories } from "@/components/home/StyleCategories"
import { HowItWorks } from "@/components/home/HowItWorks"
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <div className="min-h-screen">
      <Hero 
        title={t.rich('Hero.title', {
          span: (chunks) => <span className="text-primary italic block sm:inline">{chunks}</span>
        })}
        subtitle={t('Hero.subtitle')}
        cta={t('Hero.cta')}
        features={{
          instant: t('Hero.features.instant'),
          quality: t('Hero.features.quality'),
          unique: t('Hero.features.unique')
        }}
      />
      <HowItWorks 
        title={t.rich('HowItWorks.title', {
          span: (chunks) => <span className="text-primary-500 italic">{chunks}</span>
        })}
        steps={[
          { title: t('HowItWorks.steps.upload.title'), desc: t('HowItWorks.steps.upload.desc') },
          { title: t('HowItWorks.steps.style.title'), desc: t('HowItWorks.steps.style.desc') },
          { title: t('HowItWorks.steps.result.title'), desc: t('HowItWorks.steps.result.desc') }
        ]}
      />
      <StyleCategories 
        title={t.rich('StyleCategories.title', {
          span: (chunks) => <span className="text-primary italic">{chunks}</span>
        })}
        viewAll={t('StyleCategories.viewAll')}
        styleTranslations={{
          oil: { name: t('StyleCategories.styles.oil.name'), description: t('StyleCategories.styles.oil.description') },
          cyber: { name: t('StyleCategories.styles.cyber.name'), description: t('StyleCategories.styles.cyber.description') },
          "3d": { name: t('StyleCategories.styles.3d.name'), description: t('StyleCategories.styles.3d.description') }
        }}
      />
      <FeaturedGallery 
        title={t.rich('FeaturedGallery.title', {
          span: (chunks) => <span className="text-primary italic">{chunks}</span>
        })}
        subtitle={t('FeaturedGallery.subtitle')}
      />
    </div>
  )
}
