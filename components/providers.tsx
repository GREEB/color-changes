"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"

const NoSSR = dynamic(() => import('next-themes').then((m)=>m.ThemeProvider), { ssr: false })

export const Providers = ({ children }:{children: ReactNode })=>{
    return (
        <NoSSR
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NoSSR>
    )
}