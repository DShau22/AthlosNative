import React, { Component } from 'react';
import "./style/css/Searchbar.css"


class Searchbar extends Component {

  render() {
    return (
      <div className="search-box" onMouseLeave={this.props.mouseLeave}>
        <form onSubmit={this.props.search}>
          <input
            type="text"
            name=""
            className="search-txt"
            placeholder="Type to search"
            onChange={this.props.onSearchTextChange}
            value={this.props.searchText}
          />
          <div className='search-btn'>
            <i className="fas fa-search"></i>
            <input
              className="search-btn-input"
              type='submit'
              value=''
            />
          </div>
        </form>
      </div>
    )
  }
}

export default Searchbar
