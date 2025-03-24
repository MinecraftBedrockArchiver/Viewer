import PropTypes from 'prop-types'

function MetaEntry ({ data, onShowDetails }) {
  return (
    <tr className='align-middle'>
      <th scope='row'>{data.version}</th>
      <td>{data.archive}</td>
      <td>{data.arch}</td>
      <td class="font-monospace">{data.md5}</td>
      <td class="font-monospace">{data.sha256}</td>
      <td><button type='button' className='btn btn-primary' onClick={() => onShowDetails(data)}><i className='fa-solid fa-circle-info' /></button></td>
    </tr>
  )
}

MetaEntry.propTypes = {
  data: PropTypes.object,
  onShowDetails: PropTypes.func
}

export default MetaEntry
