import React, { Component } from 'react'
import './Upload.css'
import Dropzone from '../dropzone/Dropzone'
import Progress from '../progress/Progress'
import {
  Route,
  NavLink,
  HashRouter,
  Redirect,
  Link
} from "react-router-dom";
import ENDPOINTS from "../endpoints"
const uploadURL = ENDPOINTS.upload
class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      showGraph: false,
      redirect: false
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.setRedirect = this.setRedirect.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  onFilesAdded(files) {
    this.setState({
      files: this.state.files.concat(files)
    })
  }

  async uploadFiles() {
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = [];
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file));
    });
    try {
      await Promise.all(promises);

      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  sendRequest(file) {
   return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.upload.addEventListener("progress", event => {
     if (event.lengthComputable) {
      const copy = { ...this.state.uploadProgress };
      copy[file.name] = {
       state: "pending",
       percentage: (event.loaded / event.total) * 100
      };
      this.setState({ uploadProgress: copy });
     }
    });

    req.upload.addEventListener("load", event => {
     const copy = { ...this.state.uploadProgress };
     copy[file.name] = { state: "done", percentage: 100 };
     this.setState({ uploadProgress: copy });
     resolve(req.response);
    });

    req.upload.addEventListener("error", event => {
     const copy = { ...this.state.uploadProgress };
     copy[file.name] = { state: "error", percentage: 0 };
     this.setState({ uploadProgress: copy });
     alert("upload failed")
     reject(req.response);
    });

    const postFormData = new FormData();
    postFormData.append("uploadedFile", file, file.name);
    postFormData.append("id", "id") //change this to be user specific during account login steps
    postFormData.append("prodCode", "29shf92ka0d91201asd")

    req.open("POST", uploadURL);
    req.send(postFormData);
   });
  }

  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/graph' />
    }
  }

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <div style={afterUpload}>
          <NavLink
            className="routeButton"
            id="viewProgress"
            to="/graph"
          >
            View Your Progress!
          </NavLink>
          <button
            onClick={() =>
              this.setState({ files: [], successfullUploaded: false })
            }>
            Clear
          </button>
        </div>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      );
    }
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity:
                uploadProgress && uploadProgress.state === "done" ? .5 : 0
            }}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div className="Upload">
        <span className="Title">Upload Files</span>
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>
          <div className="Files">
            {this.state.files.map(file => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename">{file.name}</span>
                  {this.renderProgress(file)}
                </div>
              );
            })}
          </div>
        </div>
        <div className="Actions">
          {this.renderActions()}
        </div>
      </div>
    );
  }
}

var afterUpload = {
  display: "flex",
}

export default Upload
