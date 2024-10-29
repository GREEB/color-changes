"use client"
import Image from "next/image"
import { ModeToggle } from "./ui/modeToggle"
import Link from "next/link"
// import { usePathname } from 'next/navigation'
export const Nav = () => {
    // const {pathname} = usePathname()
    return (
        <nav className="flex justify-between items-center gap-5 w-full">
            <Link href={`/`}>
            <Image
                className="dark:invert"
                src="/logo.svg"
                alt="Next.js logo"
                width={180}
                height={38}
                priority
            />
            </Link>
            <ModeToggle />
        </nav>
    )
}