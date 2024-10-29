"use client"
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import data from '@/app/sites.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, formatDistance, formatRelative } from "date-fns";
import clsx from "clsx";
import { Card } from "@/components/ui/card";


export default function Home() {
  const pathname = usePathname()
  const siteData = useMemo(() => {
    const site = data.sites.find((e) => e.name === pathname.split("/")[2]);
  
    if (!site) return [];
  
    // Sort snapshots by date and normalize cssVariables
    const normalizedSnapshots = site.snapshots
      .map(snapshot => ({
        ...snapshot,
        cssVariables: normalizeCssVariables(snapshot.cssVariables),
      }))
      .sort((a, b) => b.date - a.date);
  
    return normalizedSnapshots;
  }, [pathname]);
  function normalizeCssVariables(cssVariables:string) {
      return cssVariables
        // Remove spaces around colons and semicolons
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        // Normalize rgba by adding space after each comma
        .replace(/rgba\((\d+),(\d+),(\d+),(\d*\.?\d+)\)/g, 'rgba($1, $2, $3, $4)');
    } 
  const useCountChangedVariables = useMemo(() => {
    // Parse both CSS variable strings into objects
    const cssVars1 = data.sites[0].snapshots[0].cssVariables.replaceAll(" ", "").split(";").filter((e) => e).map((e) => e.split(":"))
    const cssVars2 = data.sites[0].snapshots[1].cssVariables.replaceAll(" ", "").split(";").filter((e) => e).map((e) => e.split(":"))

    // Count the number of changed variables
    let changedCount = 0;
    for (const key in cssVars1) {
      if (cssVars1[key][1] !== cssVars2[key][1]) {
        changedCount++;
      }
    }
    return changedCount;
  }, []);

  // here we do the fetching from the local json
  // and show a timeline and stuff
  return (
    <div className="font-[family-name:var(--font-geist-sans)] p-5 min-h-screen flex flex-col justify-between">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start ">

        <Nav />
        {useCountChangedVariables > 0 ?
          <div className="flex relative">
            <div className="w-4 h-2">
              <div className="absolute top-2 w-2 h-2 animate-pulse bg-orange-400 rounded-full" />
            </div>
            Changed variables: {useCountChangedVariables}
          </div>
          :
          <div>
            no changes
          </div>
        }
        <Card className="flex p-5">

          {siteData?.map((e, i) => {
            return (<div className="flex flex-col" key={i}>
              <p className={clsx("font-black", i > 0 && "text-right")}>
                {formatDistance(new Date(e.date.toString().replace(
                  /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                  '$4:$5:$6 $2/$3/$1'
                )),new Date())} ago
              </p>

              {e.cssVariables.split(";").map((a, j) => {
                if (i > 0) {
                  
                  console.log( a.split(":")[1], siteData[0].cssVariables.split(";")[j]?.split(":")[1],  a.split(":")[1] === siteData[0].cssVariables.split(";")[j]?.split(":")[1] );
                  return (
                    <div className="flex justify-between gap-5 relative" key={j}>

                      {a.split(":")[1] !== siteData[0].cssVariables.split(";")[j]?.split(":")[1] &&
                        <div className="-top-[12px] -left-[22px] absolute">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className=" w-2 h-2 animate-pulse bg-orange-400 rounded-full" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Changed</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      }
                      <div className="w-5 h-5" style={{ background: a.split(":")[1] }}></div>
                      <div>{a.split(":").join(": ")}</div>
                    </div>
                  )
                } else {
                  return <div className="flex justify-between gap-5" key={j}><div>{a.split(":")[0]}{" "}{a.split(":")[1]}</div> <div className="w-5 h-5" style={{ background: a.split(":")[1] }}></div></div>
                }
              })}
            </div>)
          })}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
