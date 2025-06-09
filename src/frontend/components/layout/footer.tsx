import Link from "next/link"

export function Footer() {
  return (
    <footer className="glass border-t border-white/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold gradient-text mb-4">HeirAid</h3>
            <p className="text-gray-600 mb-4">
              AI-powered legal assistance for inheritance and estate planning. Secure, intelligent, and always
              available.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="text-gray-600 hover:text-blue-600">
                  AI Chat
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-gray-600 hover:text-blue-600">
                  Risk Map
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-gray-600 hover:text-blue-600">
                  Documents
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 HeirAid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
