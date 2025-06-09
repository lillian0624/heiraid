"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, Brain, Map, Check, Sparkles } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Legal Assistant</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Simplify Inheritance
            </span>
            <br className="hidden sm:block" />
            <span className="text-gray-900">With AI-Powered Guidance</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Navigate complex inheritance laws with confidence. HeirAid provides intelligent legal guidance, document
            analysis, and risk assessment to protect your legacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild className="group relative overflow-hidden px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <Link href="/chat" className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg font-medium border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:border-blue-200">
              Watch Demo
            </Button>
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white"></div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Trusted by 5,000+ legal professionals</p>
              </div>
            </div>
            <p className="text-gray-700 italic">"HeirAid transformed how we handle estate planning. The AI's accuracy saved us countless hours of research."</p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure & Confidential</h3>
                <p className="text-gray-600">Enterprise-grade security for your sensitive legal documents and communications.</p>
                <ul className="mt-4 space-y-2">
                  {['End-to-end encryption', 'GDPR compliant', 'Regular security audits'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Legal Expert</h3>
                <p className="text-gray-600">Advanced AI trained on inheritance and estate planning law.</p>
                <ul className="mt-4 space-y-2">
                  {['24/7 legal assistance', 'Document analysis', 'Case law reference'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Map className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Risk Mapping</h3>
                <p className="text-gray-600">Visual risk assessment for property and asset planning.</p>
                <ul className="mt-4 space-y-2">
                  {['Asset visualization', 'Risk scoring', 'Mitigation strategies'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
