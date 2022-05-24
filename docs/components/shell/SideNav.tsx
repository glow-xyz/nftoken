import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

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
  const router = useRouter();

  return (
    <nav>
      {items.map((item) => (
        <div key={item.title} className="mb-4">
          <h3 className="text-lg mb-2">{item.title}</h3>
          {item.links.map((link) => (
            <Link href={link.href} key={link.title}>
              <a
                className={classNames("block mb-2 ml-2", {
                  current: router.pathname === link.href,
                })}
              >
                {link.title}
              </a>
            </Link>
          ))}
        </div>
      ))}

      <style jsx>{`
        nav {
          overflow: scroll;
          max-height: 100%;
        }

        a {
          color: var(--secondary-color);
          transition: none;
          line-height: 1.3;
        }

        a:hover,
        a.current {
          text-decoration: underline;
          text-decoration-color: var(--primary-border-color);
        }

        a.current {
          color: var(--primary-color);
        }
      `}</style>
    </nav>
  );
};
