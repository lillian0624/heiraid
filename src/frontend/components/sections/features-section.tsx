import { FileText, MessageSquare, MapPin, Lock, Brain, Shield, Users, BarChart2, Zap, Code, Database } from "lucide-react"
import { cn } from "@/lib/utils"

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: string
  className?: string
}

const FeatureCard = ({ icon: Icon, title, description, delay = '0', className }: FeatureCardProps) => (
  <div 
    className={cn(
      "group relative overflow-hidden bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100",
      "hover:shadow-lg transition-all duration-500 hover:-translate-y-2",
      className
    )}
    style={{
      transitionDelay: `${delay}ms`,
      opacity: 0,
      transform: 'translateY(20px)',
      animation: 'fadeIn 0.6s ease-out forwards',
      animationDelay: `${delay}ms`
    }}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className={cn("h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors")} />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-gray-950 transition-colors">{title}</h3>
      <p className="text-gray-600 group-hover:text-gray-700 transition-colors">{description}</p>
    </div>
  </div>
)

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Legal Chat",
      description: "Get instant, accurate answers to complex inheritance questions with our AI-powered legal assistant.",
      delay: '0'
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload and analyze legal documents with AI-powered insights, summaries, and recommendations.",
      delay: '100'
    },
    {
      icon: MapPin,
      title: "Risk Mapping",
      description: "Visualize property risks and inheritance implications with interactive, data-driven maps.",
      delay: '200'
    },
    {
      icon: Lock,
      title: "Secure Vault",
      description: "Store and manage sensitive documents with bank-grade encryption and access controls.",
      delay: '0'
    },
    {
      icon: Brain,
      title: "Smart Insights",
      description: "Get AI-generated insights and recommendations based on your specific legal situation.",
      delay: '100'
    },
    {
      icon: BarChart2,
      title: "Analytics Dashboard",
      description: "Track case progress, time spent, and outcomes with comprehensive analytics.",
      delay: '200'
    },
  ]

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -right-40 -top-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -left-40 -bottom-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Everything You Need
            </span>
            <br className="hidden sm:block" />
            <span className="text-gray-900">For Modern Legal Practice</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools designed to streamline your workflow and deliver exceptional client service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-20 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-6">BUILT WITH MODERN TECHNOLOGIES</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Next.js 14</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.548,1.71 c1.428-1.4,3-2.278,4.65-1.12c1.344,0.951,1.925,3.487,0.502,6.65c-1.762,3.934-4.7,8.73-7.7,11.1 c-3.1-2.37-6-6.766-7.7-11.1C2.572,9.487,3.153,6.951,4.501,6C5.8,5.1,7.965,5.16,10.001,7.5 c1.1-1.3,2.1-2.4,2-2.7C11.801,4.9,11.801,4.8,12.001,4.8z" />
              </svg>
              <span className="font-medium">Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.108 0-.612.492-1.108 1.1-1.108s1.1.497 1.1 1.108c0 .613-.493 1.108-1.1 1.108zm8 6.891h-1.706v-3.556c0-.656-.187-2.177-1.659-2.177-1.418 0-1.636 1.242-1.636 2.109v3.624h-1.7v-7.5h1.7v1.011h.039c.307-.585.996-1.201 2.049-1.201 2.191 0 2.713 1.44 2.713 3.313v4.377z"/>
              </svg>
              <span className="font-medium">TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="font-medium">PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
