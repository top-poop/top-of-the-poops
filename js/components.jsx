const Table = ({className, children, ...props}) => {
  const c = classNames("table", "table-striped", className)
  return <table className={c} {...props}>{children}</table>
};
const Row = ({children}) => (<div className="row">{children}</div>)

const Nav = ({children}) => (<nav>{children}</nav>)

const Pagination = ({className, ...props}) => {
  const c = classNames("pagination", className)
  return <ul className={c} {...props}/>
}

const Item = ({className, active, disabled, children, ...props}) => {
  const Component = active || disabled ? "span" : 'a'
  const c = classNames(className, "page-item", {active, disabled})
  return <li className={c}>
    <Component className="page-link" disabled={disabled} {...props}>
      {children}
    </Component>
  </li>
}

const Section = ({name, children}) => {
  const c = classNames("section", `section-${name}`)
  return <div className={c}>{children}</div>
}

export {Table, Item, Section, Nav, Row, Pagination}