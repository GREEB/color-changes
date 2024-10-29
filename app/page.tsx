import React from "react";
import data from '@/app/sites.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] p-5 min-h-screen flex flex-col justify-between">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start ">
        <Nav />
        <div className="flex">

          {data.sites.map((e) => {
            return (
              <div className='p-5' key={e.name}>
                <Card className='flex justify-between'>
                  <CardHeader>
                    <CardTitle>{e.name}</CardTitle>
                    <CardDescription>Snapshots: {e.snapshots.length}</CardDescription>
                  </CardHeader>
                  <CardContent className='p-0 pr-5 flex justify-center items-center'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Link href={`page/${e.name.toLowerCase()}`}>
                            <Button>
                              <PlayIcon width={42} height={42} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Changes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
