type LayoutProps = {
  children: JSX.Element;
};

const Layout = ({ children }: LayoutProps) => {
  return <div>{children}</div>;
};

export default Layout;
