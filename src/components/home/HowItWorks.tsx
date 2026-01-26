import { Upload, Wand2, Frame } from "lucide-react"
import { ReactNode } from "react"

const ICONS = [Upload, Wand2, Frame]

interface HowItWorksProps {
  title: ReactNode
  steps: {
    title: string
    desc: string
  }[]
}

export function HowItWorks({ title, steps }: HowItWorksProps) {
  return (
    <section className="py-24 bg-stone-900 text-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            {title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-stone-800" />
          
          {steps.map((step, idx) => {
            const Icon = ICONS[idx]
            return (
              <div key={idx} className="relative flex flex-col items-center text-center z-10">
                <div className="w-24 h-24 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mb-6 shadow-xl">
                  <Icon className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-serif mb-3">{step.title}</h3>
                <p className="text-stone-400 leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
