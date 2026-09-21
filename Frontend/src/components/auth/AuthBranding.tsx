import { Truck, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AuthBranding() {
  const { t } = useTranslation()

  const features = [
    t('auth.feature1'),
    t('auth.feature2'),
    t('auth.feature3'),
    t('auth.feature4'),
    t('auth.feature5'),
  ]

  return (
    <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#211c27] via-[#1a1721] to-[#141219] p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between text-white min-h-[400px] lg:min-h-screen">
      {/* Top Header Logo */}
      <div>
        <div className="flex items-center gap-3 mb-10 lg:mb-12">
          <div className="w-9 h-9 rounded-full bg-[#f05a24] flex items-center justify-center shadow-lg shadow-[#f05a24]/30 shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide font-sans">
            Tenadam
          </span>
        </div>

        {/* Main Heading & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-[1.15] tracking-tight mb-4 whitespace-pre-line">
          {t('auth.brandingTitle')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-normal max-w-md mb-8">
          {t('auth.brandingSubtitle')}
        </p>

        {/* Feature List */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#f05a24]/20 border border-[#f05a24]/40 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#f05a24] stroke-[3]" />
              </div>
              <span className="text-slate-300 text-sm sm:text-base font-normal leading-snug">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Food Image */}
      <div className="mt-4 lg:mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <img
          src="/food-banner.jpg"
          alt="Tenadam food platter delivered fast"
          className="w-full h-44 sm:h-52 md:h-60 lg:h-64 object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
        />
      </div>
    </div>
  )
}
