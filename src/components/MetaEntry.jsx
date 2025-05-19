import PropTypes from 'prop-types'

function MetaEntry ({ data, onShowDetails }) {
  const hashesList = []
  if (data.md5) {
    hashesList.push("MD5")
  }
  if (data.sha256) {
    hashesList.push("SHA256")
  }
  if (data.sha1) {
    hashesList.push("SHA1")
  }

  return (
    <tr className='align-middle'>
      <th scope='row'>{data.version}</th>
      <td>{data.archive}</td>
      <td>{data.arch}</td>
      <td>{hashesList.length > 0 ? hashesList.join(", ") : "None"}</td>
      <td><button type='button' className='btn btn-primary' onClick={() => onShowDetails(data)}><i className='fa-solid fa-circle-info' /></button></td>
    </tr>
  )
}

MetaEntry.propTypes = {
  data: PropTypes.object,
  onShowDetails: PropTypes.func
}

export default MetaEntry
