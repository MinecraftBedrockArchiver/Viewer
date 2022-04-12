import React from 'react'

class MetaEntry extends React.Component {
  render () {
    return (
      <tr className='align-middle'>
        <th scope='row'>{this.props.data.version}</th>
        <td>{this.props.data.archive}</td>
        <td>{this.props.data.arch}</td>
        <td>{this.props.data.md5}</td>
        <td>{this.props.data.sha256}</td>
        <td><button type='button' className='btn btn-primary' onClick={() => this.props.onShowDetails(this.props.data)}><i className='fa-solid fa-circle-info' /></button></td>
      </tr>
    )
  }
}

export default MetaEntry
