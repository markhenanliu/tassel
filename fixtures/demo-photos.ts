// A8 (revised by D11): Unsplash photos standing in for portfolio work.
// Each is credited to its real photographer wherever it is shown.
// Generated from the reviewed pick list; files live in public/demo/.

export interface DemoPhoto {
  file: string;
  width: number;
  height: number;
  caption: string;
  credit: { name: string; unsplashId: string };
}

export const demoPhotos: Record<string, DemoPhoto[]> = {
  lena: [
    { file: "/demo/lena-1.jpg", width: 1200, height: 1799, caption: "Portrait along the garden path", credit: { name: "Ryan Hoffman", unsplashId: "ijhzqAm3N1Y" } },
    { file: "/demo/lena-2.jpg", width: 1200, height: 800, caption: "A hug after the ceremony", credit: { name: "Josiah Holdcroft", unsplashId: "KiwbzBuiIX0" } },
    { file: "/demo/lena-3.jpg", width: 1200, height: 1800, caption: "Cap toss with roommates", credit: { name: "Satria Perkasa", unsplashId: "mJkuWrBj1wI" } },
    { file: "/demo/lena-4.jpg", width: 1200, height: 1800, caption: "Family moment with the cap", credit: { name: "Melanie Rosillo Galvan", unsplashId: "Y-iUaY5nBx0" } },
    { file: "/demo/lena-5.jpg", width: 1200, height: 1800, caption: "Confetti", credit: { name: "Sebastian Latorre", unsplashId: "ld1xBklhjaA" } },
    { file: "/demo/lena-6.jpg", width: 1200, height: 1800, caption: "Honors stole, late afternoon", credit: { name: "Omar Lopez", unsplashId: "Q92R1693oSI" } },
  ],
  jordan: [
    { file: "/demo/jordan-1.jpg", width: 1200, height: 800, caption: "Cap toss from below", credit: { name: "Ugip", unsplashId: "huHkFmVglLk" } },
    { file: "/demo/jordan-2.jpg", width: 1200, height: 800, caption: "Walking the arcade", credit: { name: "Rosalind Chang", unsplashId: "EAOxFEI7oJ4" } },
    { file: "/demo/jordan-3.jpg", width: 1200, height: 800, caption: "Class cap toss at sunset", credit: { name: "Pang Yuhao", unsplashId: "_kd5cxwZOK4" } },
  ],
  sam: [
    { file: "/demo/sam-1.jpg", width: 1200, height: 1500, caption: "Studio portrait, black and white", credit: { name: "Dmytro Tolokonov", unsplashId: "W-6PUFGYtLc" } },
    { file: "/demo/sam-2.jpg", width: 1200, height: 1800, caption: "Hoodie portrait", credit: { name: "Robbie Down", unsplashId: "f3vwAXn7pgg" } },
    { file: "/demo/sam-3.jpg", width: 1200, height: 936, caption: "Natural light, black and white", credit: { name: "Rachel McDermott", unsplashId: "0fN7Fxv1eWA" } },
    { file: "/demo/sam-4.jpg", width: 1200, height: 800, caption: "Low-key portrait", credit: { name: "Payton Tuttle", unsplashId: "RFFR1JjkJx8" } },
  ],
  aiden: [
    { file: "/demo/aiden-1.jpg", width: 1200, height: 1800, caption: "Close-up portrait", credit: { name: "Yoad Shejtman", unsplashId: "YhMFYJZgMA0" } },
    { file: "/demo/aiden-2.jpg", width: 1200, height: 1810, caption: "Field portrait", credit: { name: "Sinitta Leunen", unsplashId: "Y6fw-exCnsg" } },
    { file: "/demo/aiden-3.jpg", width: 1200, height: 796, caption: "Beach portrait", credit: { name: "anastasiia mazurok", unsplashId: "ibVelAWabp8" } },
    { file: "/demo/aiden-4.jpg", width: 1200, height: 796, caption: "Black and white portrait", credit: { name: "Blake Cheek", unsplashId: "v1wJn_gL7e4" } },
  ],
  noor: [
    { file: "/demo/noor-1.jpg", width: 1200, height: 1800, caption: "Last light in the grass", credit: { name: "amin naderloei", unsplashId: "AifhUcwvaL8" } },
    { file: "/demo/noor-2.jpg", width: 1200, height: 1800, caption: "Backlit at sunset", credit: { name: "Jes\u00fas Bosc\u00e1n", unsplashId: "rhbwUW2i0tM" } },
    { file: "/demo/noor-3.jpg", width: 1200, height: 1500, caption: "Golden hour by the water", credit: { name: "Benny Hassum", unsplashId: "9_l3-0I40w8" } },
    { file: "/demo/noor-4.jpg", width: 1200, height: 800, caption: "Blue hour", credit: { name: "Riki Ramdani", unsplashId: "KvKXShljbWQ" } },
    { file: "/demo/noor-5.jpg", width: 1200, height: 1680, caption: "Late afternoon against brick", credit: { name: "Noah Page", unsplashId: "pCByGUy9bKo" } },
  ],
  theo: [
    { file: "/demo/theo-1.jpg", width: 1200, height: 1557, caption: "Cap and gown, quick set", credit: { name: "Donald Teel", unsplashId: "jzcXsWmvKlw" } },
    { file: "/demo/theo-2.jpg", width: 1200, height: 1800, caption: "Gown portrait in the garden", credit: { name: "Cole Keister", unsplashId: "SRs7zDrj150" } },
    { file: "/demo/theo-3.jpg", width: 1200, height: 1800, caption: "Two graduates", credit: { name: "Nqobile Vundla", unsplashId: "zOt6a59k2BE" } },
  ],
  chloe: [
    { file: "/demo/chloe-1.jpg", width: 1200, height: 1800, caption: "Lit portrait, black background", credit: { name: "Alyona Grishina", unsplashId: "BBmi4nJjKk8" } },
    { file: "/demo/chloe-2.jpg", width: 1200, height: 1799, caption: "Single-light editorial", credit: { name: "Olena Bohovyk", unsplashId: "6eFmG1qWxJI" } },
    { file: "/demo/chloe-3.jpg", width: 1200, height: 1799, caption: "Turtleneck portrait", credit: { name: "Teslariu Mihai", unsplashId: "UWUlKFicthA" } },
    { file: "/demo/chloe-4.jpg", width: 1200, height: 1800, caption: "Warm key light", credit: { name: "Moein Razavi", unsplashId: "nM4zZ16DMl4" } },
    { file: "/demo/chloe-5.jpg", width: 1200, height: 1500, caption: "High-key black and white", credit: { name: "Bekah Allmark", unsplashId: "Qt0ogPnhGWY" } },
  ],
};
