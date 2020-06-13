import React, { Component } from 'react'
import './Dropzone.css'

//*** this is the circular part in the upload page ***

class Dropzone extends Component {
  constructor(props) {
    super(props)
    this.state = { hightlight: false }
    this.fileInputRef = React.createRef()

    this.openFileDialog = this.openFileDialog.bind(this)
    this.onFilesAdded = this.onFilesAdded.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
  }

  openFileDialog() {
    if (this.props.disabled) return
    this.fileInputRef.current.click()
  }

  onFilesAdded(evt) {
    if (this.props.disabled) return
    const files = evt.target.files
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files)
      this.props.onFilesAdded(array)
    }
  }

  onMouseOver(e) {
    e.preventDefault()

    if (this.props.disabled) return

    this.setState({ highlight: true })
  }

  onMouseLeave(e) {
    this.setState({ highlight: false })
  }

  onDragOver(evt) {
    evt.preventDefault()

    if (this.props.disabled) return

    this.setState({ hightlight: true })
  }

  onDragLeave() {
    this.setState({ hightlight: false })
  }

  onDrop(event) {
    event.preventDefault()

    if (this.props.disabled) return

    const files = event.dataTransfer.files
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files)
      this.props.onFilesAdded(array)
    }
    this.setState({ hightlight: false })
  }

  fileListToArray(list) {
    const array = []
    for (var i = 0; i < list.length; i++) {
      array.push(list.item(i))
    }
    return array
  }

  render() {
    return (
      <div
        className={`Dropzone ${this.state.hightlight ? 'Highlight' : ''}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.openFileDialog}
        onMouseLeave={this.onMouseLeave}
        onMouseOver={this.onMouseOver}
        style={{ cursor: this.props.disabled ? 'default' : 'pointer' }}
      >
        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          multiple
          onChange={this.onFilesAdded}
        />
        <img
          alt="upload"
          className="Icon"
          src="baseline-cloud_upload-24px.svg"
        />
        <span>Upload Files</span>
      </div>
    )
  }
}

export default Dropzone
