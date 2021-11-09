import * as React from 'react';
import {useGlobalFilter, usePagination, useSortBy, useTable} from 'react-table';
import {PageItem, Pagination, Table} from "react-bootstrap";

function GlobalFilter({
                        preGlobalFilteredRows,
                        globalFilter,
                        setGlobalFilter,
                      }) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = value => {
    setGlobalFilter(value || undefined)
  }

  return (
    <span>
      <input
        className="form-control"
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search ${count} records...`}
      />
        </span>
  )
}

function PaginatedTable({columns, data, ...props}) {
  const {
    getTableProps, getTableBodyProps, headerGroups, prepareRow,
    page, canPreviousPage, canNextPage, pageOptions, pageCount,
    gotoPage, nextPage, previousPage, setPageSize,
    preGlobalFilteredRows, setGlobalFilter,
    state: {pageIndex, pageSize, globalFilter},
  } = useTable(
    {
      columns,
      data,
      initialState: {pageIndex: 0, pageSize: 10},
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  )

  const pagination = () => {
    if (pageCount > 1) {
      return <Pagination>
        <PageItem onClick={() => gotoPage(0)} disabled={!canPreviousPage}>First</PageItem>
        <PageItem onClick={() => previousPage()} disabled={!canPreviousPage}>&lt;</PageItem>
        <PageItem onClick={() => nextPage()} disabled={!canNextPage}>&gt;</PageItem>
        <PageItem onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>Last</PageItem>
        <li><a className="page-link">Page {pageIndex + 1} of {pageCount}</a></li>
      </Pagination>
    } else {
      return <div></div>
    }
  }

  const filter = () => {
    if (data.length > pageSize) {
      return <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows}
                           globalFilter={globalFilter}
                           setGlobalFilter={setGlobalFilter}/>
    } else {
      return <div></div>
    }
  }

  return <div className="table-wrapper">
    <div className="filter-pagination">
      {filter()}
      {pagination()}
    </div>
    <Table {...getTableProps()} {...props}>
      <thead>
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render('title')}
              <span>
                {column.isSorted
                  ? column.isSortedDesc
                    ? ' ↓'
                    : ' ↑'
                  : ''}
                </span>
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody>
      {page.map((row, i) => {
        prepareRow(row)
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map(cell => <td {...cell.getCellProps()}>{cell.render('Cell')}</td>)}
          </tr>
        )
      })
      }
      </tbody>
    </Table>
  </div>
}

class LoadingTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
  }

  async componentDidMount() {
    const r = await fetch(this.props.url);
    const j = await r.json();
    this.setState({data: j});
  }

  render() {
    return <PaginatedTable striped columns={this.props.columns} data={this.state.data}/>
  }
}

export {LoadingTable, PaginatedTable};
