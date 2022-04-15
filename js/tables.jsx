import * as React from 'react';
import {useGlobalFilter, usePagination, useSortBy, useTable} from 'react-table';
import {Col, Container, PageItem, Pagination, Row, Table} from "react-bootstrap";

const anyWordFilter = (rows, columnIds, value) => {
    const words = value.split(" ")
        .map(it => it.trim())
        .map(it => it.toLowerCase())
        .filter(it => it.length > 0)

    return rows.filter(row => {
        return words.every(word => {
            return columnIds.some(columnId => {
                const cellValue = String(row.values[columnId]).toLowerCase()
                return cellValue.includes(word)
            })
        })
    })
}

function GlobalFilter({
                          preGlobalFilteredRows,
                          globalFilter,
                          setGlobalFilter,
                      }) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = value => {
        if (value) {
            setGlobalFilter(value)
        } else {
            setGlobalFilter(undefined)
        }
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
        getTableProps, getTableBodyProps, headerGroups, footerGroups, prepareRow,
        page, canPreviousPage, canNextPage, pageOptions, pageCount,
        gotoPage, nextPage, previousPage, setPageSize,
        preGlobalFilteredRows, setGlobalFilter,
        state: {pageIndex, pageSize, globalFilter},
    } = useTable(
        {
            columns,
            data,
            initialState: {pageIndex: 0, pageSize: 10},
            globalFilter: anyWordFilter
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
        <Container fluid={true}>
            <Row>
                <Col sm>
                    {filter()}
                </Col>
                <Col sm>
                    {pagination()}
                </Col>
            </Row>
            <Row>
                <Col>
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
                        <tfoot>
                        {footerGroups.map(group => (
                            <tr {...group.getFooterGroupProps()}>
                                {group.headers.map(column => (
                                    <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                                ))}
                            </tr>
                        ))}
                        </tfoot>
                    </Table>
                </Col>
            </Row>
        </Container>
    </div>
}

class LoadingTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            data: [],
        }
    }

    async componentDidMount() {
        const r = await fetch(this.props.url);
        const j = await r.json();
        this.setState({loaded: true, data: j});
    }

    render() {
        if (!this.state.loaded) {
            return <div style={{height: 600}}></div>
        } else {
            return <div className="table-responsive">
                <PaginatedTable striped columns={this.props.columns} data={this.state.data}/>
            </div>
        }

    }
}

export {LoadingTable, PaginatedTable};
