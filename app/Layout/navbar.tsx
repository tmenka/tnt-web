"use client";
import { useState } from "react";
import Link from "next/link";


type NavigationProps = {
  pocetna: string;
  radno_vrijeme: string;
  team_tnt: string;
  galerija: string;
  rodendani: string;
  kontakt: string;
};

export function Navbar() {

  const [navigation, setNavigation] = useState<NavigationProps>({
    pocetna: "Početna stranica",
    radno_vrijeme: "Radno vrijeme i cjenik",
    team_tnt: "Team TNT",
    galerija: "Galerija",
    rodendani: "Rođendani",
    kontakt: "Kontakt",
    
  });

  const { pocetna, radno_vrijeme, team_tnt, galerija, rodendani, kontakt } = navigation;

  return (
<div className="flex flex-row items-center justify-end w-auto top-0 gap-4 text-sm font-normal my-4">
              <Link
                aria-label="Logo"
                href={""}
                className=""
              >
              </Link>
              <Link
                aria-label=""
                href={"/"}
                className=""
              >
                {pocetna}
              </Link>
              <Link
                aria-label=""
                href={"/radno-vrijeme-cjenik"}
                className=""
              >
                {radno_vrijeme}
              </Link>
              <Link
                aria-label=""
                href={"team-tnt"}
                className=""
              >
                {team_tnt}
              </Link>
              <Link
                aria-label=""
                href={"galerija"}
                className=""
              >
                {galerija}
              </Link>
              <Link
                aria-label=""
                href={"rodendani"}
                className=""
              >
                {rodendani}
              </Link>
              <Link
                aria-label=""
                href={"kontakt"}
                className=""
              >
                {kontakt}
              </Link>
    </div>
  );
}
