// import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google";
// import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

// const mono = JetBrains_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
// });

// export const metadata: Metadata = {
//   title: "Web Todo",
//   description: "Phase II Web Todo App",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${inter.variable} ${mono.variable} antialiased`}>
//         {children}
//       </body>
//     </html>
//   );
// }





import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Hackathon Phase II Todo App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
