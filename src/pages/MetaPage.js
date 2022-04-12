import React from 'react'
import MetaEntry from '../components/MetaEntry'

class MetaPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      metadata: [],
      archs: [],
      files: {},
      loading: true,
      currentDetails: {},

      filterArchive: '',
      filterArch: '',
      filterSearch: ''
    }

    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleShowDetails = this.handleShowDetails.bind(this)
    this.getResults = this.getResults.bind(this)
    this.expandArchs = this.expandArchs.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData () {
    window.fetch('https://minecraftbedrockarchiver.github.io/Metadata/files.json').then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw Error(response.statusText)
      }
    }).then(async (data) => {
      this.setState({ files: data })

      for (const name in data) {
        const file = data[name]
        await window.fetch('https://minecraftbedrockarchiver.github.io/Metadata/' + file).then((response) => {
          if (response.status === 200) {
            return response.json()
          } else {
            throw Error(response.statusText)
          }
        }).then(async (data) => {
          const metadata = this.state.metadata
          metadata[name] = data

          const updatedArchs = this.state.archs
          Object.values(data).forEach(version => {
            Object.keys(version.Archs).forEach(arch => {
              if (updatedArchs.indexOf(arch) === -1) {
                updatedArchs.push(arch)
              }
            })
          })

          this.setState({ metadata: metadata, archs: updatedArchs })
        }).catch((err) => {
          console.log('Something went wrong ', err)
        })
      }

      this.setState({ loading: false })
    }).catch((err) => {
      console.log('Something went wrong ', err)
    })
  }

  handleFilterChange (e) {
    const changes = {}
    changes[e.target.id] = e.target.value
    this.setState(changes)
  }

  handleShowDetails (data) {
    this.setState({ currentDetails: data })
    const detailsModal = window.bootstrap.Modal.getOrCreateInstance(document.querySelector('#detailsModal'))
    detailsModal.show()
  }

  getResults () {
    if (this.state.loading) {
      return []
    }

    let results = []

    if (this.state.filterArchive !== '') {
      results = this.expandArchs(Object.values(this.state.metadata[this.state.filterArchive]).map(entry => {
        entry.Archive = this.state.filterArchive
        return entry
      }))
    } else {
      Object.keys(this.state.files).forEach(archive => {
        results = results.concat(this.expandArchs(Object.values(this.state.metadata[archive]).map(entry => {
          entry.Archive = archive
          return entry
        })))
      })
    }

    if (this.state.filterArch !== '') {
      results = results.filter((entry) => entry.arch === this.state.filterArch)
    }

    if (this.state.filterSearch !== '') {
      const searchLower = this.state.filterSearch.toLowerCase()
      results = results.filter((entry) => entry.version.toLowerCase().includes(searchLower) ||
        (entry.md5 !== null && entry.md5.toLowerCase().includes(searchLower)) ||
        (entry.sha256 !== null && entry.sha256.toLowerCase().includes(searchLower)))
    }

    return results.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true, sensitivity: 'base' }))
  }

  expandArchs (entries) {
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
          file: archData.FileName
        })
      }
    })

    return out
  }

  render () {
    const results = this.getResults()

    let content = ''
    if (this.state.loading) {
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
              <th scope='col'>MD5</th>
              <th scope='col'>SHA256</th>
              <th scope='col'>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {results.map((entry, i) => (<MetaEntry key={i + '.' + entry.archive + '.' + entry.version} data={entry} onShowDetails={this.handleShowDetails} />))}
          </tbody>
        </table>
      )
    }

    return (
      <div className='container'>
        <h1 className='text-center'>Minecraft: Bedrock archive viewer</h1>

        <div class='mb-1'>
          <label for='filterSearch' class='form-label'>Search</label>
          <input type='text' class='form-control' id='filterSearch' placeholder='Version or hash' value={this.state.filterSearch} onChange={this.handleFilterChange} />
        </div>

        <div className='row'>
          <div className='col-6'>
            <label for='filterArchive' class='form-label'>Archive</label>
            <select class='form-select' aria-label='Archive select' id='filterArchive' value={this.state.filterArchive} onChange={this.handleFilterChange}>
              <option value=''>All</option>
              {Object.keys(this.state.files).map((name, i) => (<option key={i} value={name}>{name}</option>))}
            </select>
          </div>

          <div className='col-6'>
            <label for='filterArch' class='form-label'>Architecture</label>
            <select class='form-select' aria-label='Arch select' id='filterArch' value={this.state.filterArch} onChange={this.handleFilterChange}>
              <option value=''>All</option>
              {this.state.archs.map((name, i) => (<option key={i} value={name}>{name}</option>))}
            </select>
          </div>
        </div>

        <hr />

        {content}

        <div className='modal fade' id='detailsModal' tabindex='-1' aria-labelledby='detailsModalLabel' aria-hidden='true'>
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
                      {this.state.currentDetails.version}
                    </div>
                    <div className='col-4'>
                      <b>Archive:</b><br />
                      {this.state.currentDetails.archive}
                    </div>
                    <div className='col-4'>
                      <b>Architecture:</b><br />
                      {this.state.currentDetails.arch}
                    </div>
                  </div>
                  <div className='mb-1'>
                    <b>Original Filename:</b><br />
                    {this.state.currentDetails.file}
                  </div>
                  <div className='mb-1'>
                    <b>MD5 hash:</b><br />
                    {this.state.currentDetails.md5}
                  </div>
                  <div className='mb-1'>
                    <b>SHA256 hash:</b><br />
                    {this.state.currentDetails.sha256}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MetaPage
