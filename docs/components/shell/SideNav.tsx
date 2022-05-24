import Link from "next/link";

const items = [
  {
    title: "Getting Started",
    links: [
      { title: "Overview", href: "/" },
      { title: "Installation", href: "/installation" },
      { title: "Usage", href: "/usage" },
    ],
  },
  {
    title: "Cookbook",
    links: [{ title: "Getting NFTs from a wallet", href: "/from-wallet" }],
  },
];

export const SideNav = () => {
  return (
    <nav>
      {items.map((item) => (
        <div key={item.title} className="mb-4">
          <h3 className="text-lg mb-2">{item.title}</h3>
          {item.links.map((link) => (
            <Link href={link.href} key={link.title}>
              <a className="block mb-1 ml-2">{link.title}</a>
            </Link>
          ))}
        </div>
      ))}

      <style jsx>{`
        nav {
          overflow: scroll;
        }
      `}</style>
    </nav>
  );
};
