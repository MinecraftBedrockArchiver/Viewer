import { useEffect, useState } from 'react'
import MetaEntry from '../components/MetaEntry'

function MetaPage () {
  const [metadata, setMetadata] = useState([])
  const [archs, setArchs] = useState([])
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentDetails, setCurrentDetails] = useState({})

  const [filterArchive, setFilterArchive] = useState('')
  const [filterArch, setFilterArch] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    window.fetch('https://minecraftbedrockarchiver.github.io/Metadata/files.json').then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw Error(response.statusText)
      }
    }).then(async (data) => {
      setFiles(data)

      for (const name in data) {
        const file = data[name]
        await window.fetch('https://minecraftbedrockarchiver.github.io/Metadata/' + file).then((response) => {
          if (response.status === 200) {
            return response.json()
          } else {
            throw Error(response.statusText)
          }
        }).then(async (data) => {
          const updatedMetadata = metadata
          updatedMetadata[name] = data

          const updatedArchs = archs
          Object.values(data).forEach(version => {
            Object.keys(version.Archs).forEach(arch => {
              if (updatedArchs.indexOf(arch) === -1) {
                updatedArchs.push(arch)
              }
            })
          })

          setMetadata(updatedMetadata)
          setArchs(updatedArchs)
        }).catch((err) => {
          console.log('Something went wrong ', err)
        })
      }

      setLoading(false)
    }).catch((err) => {
      console.log('Something went wrong ', err)
    })
  }

  const handleShowDetails = (data) => {
    setCurrentDetails(data)
    const detailsModal = window.bootstrap.Modal.getOrCreateInstance(document.querySelector('#detailsModal'))
    detailsModal.show()
  }

  const getResults = () => {
    if (loading) {
      return []
    }

    let results = []

    if (filterArchive !== '') {
      results = expandArchs(Object.values(metadata[filterArchive]).map(entry => {
        entry.Archive = filterArchive
        return entry
      }))
    } else {
      Object.keys(files).forEach(archive => {
        results = results.concat(expandArchs(Object.values(metadata[archive]).map(entry => {
          entry.Archive = archive
          return entry
        })))
      })
    }

    if (filterArch !== '') {
      results = results.filter((entry) => entry.arch === filterArch)
    }

    if (filterSearch !== '') {
      const searchLower = filterSearch.toLowerCase()
      results = results.filter((entry) => entry.version.toLowerCase().includes(searchLower) ||
        (entry.md5 !== null && entry.md5.toLowerCase().includes(searchLower)) ||
        (entry.sha256 !== null && entry.sha256.toLowerCase().includes(searchLower)) ||
        (entry.sha1 !== null && entry.sha1.toLowerCase().includes(searchLower)))
    }

    return results.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true, sensitivity: 'base' }))
  }

  const expandArchs = (entries) => {
    const out = []

    entries.forEach(entry => {
      for (const arch in entry.Archs) {
        const archData = entry.Archs[arch]
        out.push({
          archive: entry.Archive,
          version: entry.Version,
          arch: arch,
          md5: archData.Hashes.MD5,
          sha256: archData.Hashes.SHA256,
          sha1: archData.Hashes.SHA1,
          file: archData.FileName
        })
      }
    })

    return out
  }

  const results = getResults()

  let content = ''
  if (loading) {
    content = <p>Loading</p>
  } else if (results.length === 0) {
    content = <p>No data</p>
  } else {
    content = (
      <table className='table table-hover table-striped text-center'>
        <thead>
          <tr>
            <th scope='col'>Version</th>
            <th scope='col'>Archive</th>
            <th scope='col'>Architecture</th>
            <th scope='col'>Hashes</th>
            <th scope='col'>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry, i) => (<MetaEntry key={i + '.' + entry.archive + '.' + entry.version} data={entry} onShowDetails={handleShowDetails} />))}
        </tbody>
      </table>
    )
  }

  return (
    <div className='container'>
      <h1 className='text-center'>Minecraft: Bedrock archive viewer</h1>

      <div className='mb-1'>
        <label htmlFor='filterSearch' className='form-label'>Search</label>
        <input type='text' className='form-control' id='filterSearch' placeholder='Version or hash' value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
      </div>

      <div className='row'>
        <div className='col-6'>
          <label htmlFor='filterArchive' className='form-label'>Archive</label>
          <select className='form-select' aria-label='Archive select' id='filterArchive' value={filterArchive} onChange={e => setFilterArchive(e.target.value)}>
            <option value=''>All</option>
            {Object.keys(files).map((name, i) => (<option key={i} value={name}>{name}</option>))}
          </select>
        </div>

        <div className='col-6'>
          <label htmlFor='filterArch' className='form-label'>Architecture</label>
          <select className='form-select' aria-label='Arch select' id='filterArch' value={filterArch} onChange={e => setFilterArch(e.target.value)}>
            <option value=''>All</option>
            {archs.map((name, i) => (<option key={i} value={name}>{name}</option>))}
          </select>
        </div>
      </div>

      <hr />

      {content}

      <div className='modal fade' id='detailsModal' tabIndex='-1' aria-labelledby='detailsModalLabel' aria-hidden='true'>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='detailsModalLabel'>Version details</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' />
            </div>
            <div className='modal-body'>
              <div className='container-fluid'>
                <div className='row mb-1'>
                  <div className='col-4'>
                    <b>Version:</b><br />
                    {currentDetails.version}
                  </div>
                  <div className='col-4'>
                    <b>Archive:</b><br />
                    {currentDetails.archive}
                  </div>
                  <div className='col-4'>
                    <b>Architecture:</b><br />
                    {currentDetails.arch}
                  </div>
                </div>
                <div className='mb-1'>
                  <b>Original Filename:</b><br />
                  {currentDetails.file}
                </div>
                <div className='mb-1'>
                  <b>MD5 hash:</b><br />
                  <span className='font-monospace'>{currentDetails.md5 || 'None'}</span>
                </div>
                <div className='mb-1'>
                  <b>SHA256 hash:</b><br />
                  <span className='font-monospace'>{currentDetails.sha256 || 'None'}</span>
                </div>
                <div className='mb-1'>
                  <b>SHA1 hash:</b><br />
                  <span className='font-monospace'>{currentDetails.sha1 || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetaPage
