import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logo/images.jpeg" 
              alt="LSLS Logo" 
              className="h-6 w-6 rounded object-cover"
            />
            <span className="text-sm text-gray-600">© 2024 LSLS - School Management System</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Management Team:</span>{" "}
              <span className="text-primary">Zara Hussain</span>
            </div>
            <Link href="/about" className="text-primary hover:underline">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

