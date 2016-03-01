import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { uiShowAuthenticationForm } from '../../actions/ui';
import { userSetUser } from '../../actions/user';
import 'isomorphic-fetch';
import invariant from 'invariant';


/**
 * default visibility and text for error labels
 * @type {Object}
 */
const errors = {
  signinError: {
    visible: false,
    text: 'none',
  },
};

class SignInForm extends Component {

  static propTypes = {
    uiShowAuthenticationForm: PropTypes.func.isRequired,
    userSetUser: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = Object.assign({}, errors);
  }

  get emailAddress() {
    return this.refs.emailAddress.value.trim();
  }
  get password() {
    return this.refs.password.value.trim();
  }

  /**
   * display server errors in the most logical way
   */
  showServerErrors(json) {
    invariant(json && json.message, 'We expected an error message');

    // any unrecognized errors are displayed below the tos
    this.setState({
      signinError: {
        visible: true,
        text: json.message,
      }
    });
  }

  // on form submission, first perform client side validation then submit
  // to the server if that goes well.
  onSubmit(evt) {
    // submission occurs via REST not form submission
    evt.preventDefault();

    // get the API end point
    const endPoint = `${window.location.origin}/auth/login`;

    fetch(endPoint, {
      credentials: 'include', // allow cookies
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: this.emailAddress, password: this.password}),
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if (json.message) {
        this.showServerErrors(json);
        return;
      }
      // set the user
      this.props.userSetUser({
        userid: json.uuid,
        email: json.email,
        firstName: json.firstName,
        lastName: json.lastName,
      });
      // close the form
      this.props.uiShowAuthenticationForm('none')
      console.log(JSON.stringify(json, null, 2));
    })
    .catch((reason) => {
      this.showServerErrors({
        message: 'Unexpected error, please check your connection'
      });
      console.error(`Exception: ${reason.toString()}`);
    });

  }

  render() {
    return (
      <div className="container">
        <form className="authentication-form" onSubmit={this.onSubmit.bind(this)}>
          <div className="title">Sign In</div>
          <input ref="emailAddress" className="input" placeholder="Email Address"/>
          <input type="password" ref="password" className="input" placeholder="Password"/>
          <div className={`error ${this.state.signinError.visible ? 'visible' : ''}`}>{`${this.state.signinError.text}`}</div>
          <button type="submit">Sign In</button>
          <button type="button" onClick={() => {
              this.props.uiShowAuthenticationForm('none');
            }}>Cancel</button>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, {
  uiShowAuthenticationForm,
  userSetUser,
})(SignInForm);
