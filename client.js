import React from 'react';
import ReactDOM from 'react-dom';
import Autolinker from 'autolinker';
import moment from 'moment';

const socket = io(),
	appName = 'Bonkiechat 2.0',
	botName = 'Jenkins';

require('./style.less');

class Message extends React.Component {

	constructor(props) {
		super(props);
		
		this.createMarkup = this.createMarkup.bind(this);
	}

	createMarkup() {
		return { __html: this.props.text };
	}

	render() {
		return (
			<li className={this.props.owner || '' + ' message'}>
				<time>{this.props.time}</time>
				&lt;<strong>{this.props.user}</strong>&gt;
				<span dangerouslySetInnerHTML={this.createMarkup()}></span>
			</li>
		);
	}
}

class MessageList extends React.Component {

	render() {
		return (
			<ul id='messages'>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text}
								owner={message.role}
								time={message.time}
							/>
						);
					})
				}
			</ul>
		);
	}
}

class MessageForm extends React.Component {
	
	constructor(props) {
		super(props);
		
		this.state = { text: '' };

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		document.getElementById('message-input').focus();
	}

	handleSubmit(e) {
		e.preventDefault();
		let message = {
			user: this.props.user,
			message: this.state.text,
			role: 'self',
			time: moment().format('HH:mm')
		}

		this.props.submitMessage(message);
		this.setState({ text: '' });

	}

	handleChange(e) {
		this.setState({ text: e.target.value });
	}

	render() {

		return (
			<form id='message-form' onSubmit={this.handleSubmit}>
				<input id='message-input'
					onChange={this.handleChange} 
					value={this.state.text} 
					placeholder='Input message here'
				/>
			</form>
		);
	}
}


class UserList extends React.Component {

	render() {
		return (
			<ul id='users'>
				{
					this.props.users.map((user, i) => {
						if (user != this.props.user) {
							return ( <li key={i}>{user}</li> );
						}
					})
				}
			</ul>
		)
	}
}

class UserForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = { newName: '' }

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		let name = this.props.user;
		this.setState({ newName: name });
	}

	handleSubmit(e) {
		e.preventDefault();

		let newName = this.state.newName;
		this.props.nameChange(newName);
	}

	handleChange(e) {
		this.setState({ newName: e.target.value });
	}

	render() {

		return (
			<form id='user-form' onSubmit={this.handleSubmit}>
				<input id='user-name'
					onChange={this.handleChange} 
					onBlur={this.handleSubmit} 
					value={this.state.newName} 
				/>
			</form>
		)
	}
}

class InitForm extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = { name: '' };

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		document.getElementById('init-input').focus();
	}	

	handleSubmit(e) {
		e.preventDefault();

		let newName = this.state.name;
		this.props.initUser(newName);
		this.setState({ name: '' });
	}

	handleChange(e) {
		this.setState({ name: e.target.value });
	}

	render() {
		return (
			<form id='init-form' className={this.props.theme} onSubmit={this.handleSubmit}>
				<input id='init-input'
					onChange={this.handleChange}
					value={this.state.name}
					placeholder='Input name here'
				/>
			</form>
		);
	}
}

class ChatApp extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			users: [],
			messages: [],
			name: '',
			theme: 'light',
			focused: true,
			unread: 0
		};

		this._userJoined = this._userJoined.bind(this);
		this._userLeft = this._userLeft.bind(this);
		this._userChangedName = this._userChangedName.bind(this);
		this._messageReceive = this._messageReceive.bind(this);
		this.initializeUser = this.initializeUser.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
		this.themeToggle = this.themeToggle.bind(this);
		this.renderMessage = this.renderMessage.bind(this);
	}

	componentDidMount() {
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('user:changed', this._userChangedName);
		socket.on('message:receive', this._messageReceive);

		document.addEventListener('focus', (e) => {
			this.setState({ focused: true, unread: 0 });
			document.title = appName;
		});

		document.addEventListener('blur', (e) => {
			this.setState({ focused: false });
		});
	}

	_userJoined(data) {
		if (data.name && this.state.name) {

			let { users, messages } = this.state,
				{ name } = data;
			
			if (name != this.state.name) users.push(name);

			messages.push({
				user: botName,
				role: 'bot',
				text: `<em>${name}</em> joined ${appName}`,
				time: moment().format('HH:mm')
			});

		this.setState({ users, messages }, this.renderMessage);
		}
	}

	_userLeft(data) {
		if (data.name && this.state.name) {

			let { users, messages } = this.state,
				{ name } = data,
				index = users.indexOf(name);

			if (index > -1) users.splice(index, 1);
			messages.push({
				user: botName,
				role: 'bot',
				text: `<em>${name}</em> left ${appName}`,
				time: moment().format('HH:mm')
			});

			this.setState({ users, messages }, this.renderMessage);
		}
	}

	_userChangedName(data) {
		if (this.state.name) {

			let { oldName, newName } = data,
				{ name, users, messages } = this.state,
				index = users.indexOf(oldName);

			users.splice(index, 1, newName);

			messages.push({
				user: botName,
				role: 'bot',
				text: `<em>${oldName}</em> is now called <em><strong>${newName}</strong></em>`,
				time: moment().format('HH:mm')
			});

			this.setState({ users, messages }, this.renderMessage);
		}
	}

	_messageReceive(message) {
		if (this.state.name) {
			let { messages } = this.state;

			message.text = Autolinker.link(message.text, { truncate: 30, mention: 'instagram' });
			message.role = 'other';
			message.time = moment().format('HH:mm');

			messages.push(message);
			this.setState({ messages }, this.renderMessage);
		}
	}

	initializeUser(name) {
		socket.emit('user:init', { name }, data => {
			if (data.error) {
				alert(data.error);	
			} else if (data.name == name) {
				this.setState(data);
			}
		});
	}

	handleNameChange(newName) {
		let oldName = this.state.name;
		if (newName == oldName) return false;

		this.setState({ name: newName });
		this._userChangedName({ oldName, newName });	

		socket.emit('user:name', { newName }, (result) => {
			if(result.error) alert(result.error);
		});

	}

	handleSubmitMessage(data) {
		if (data.message.length > 0) {

			data.message = Autolinker.link(data.message, { truncate: 30, mention: 'instagram' });

			let { messages } = this.state,
				message = {
					user: this.state.name,
					role: 'self',
					text: data.message,
					time: moment().format('HH:mm')
				};

			messages.push(message);
			this.setState({ messages }, this.renderMessage);
			socket.emit('message:send', message);
		}
	}

	themeToggle() {
		let theme = this.state.theme;

		if (theme == 'light') {
			this.setState({ theme: 'dark' });
		} else {
			this.setState({ theme: 'light' });
		}
	}

	renderMessage() {
		let { name, focused, unread } = this.state;

		if (!focused && name) {
			unread++
			document.title = `(${unread}) ${appName}`
			this.setState({ unread });
		}

		if (name) {
			let container = document.getElementById('messages');
			container.scrollTop = container.scrollHeight;
		}
	}

	render() {
		if (this.state.name) {
			
			return(
				<div className={this.state.theme}>
					<h1>{this.state.focused}</h1>
					<UserList 
						users={this.state.users} 
						user={this.state.name}
					/>
					<UserForm 
						nameChange={this.handleNameChange}
						user={this.state.name} 
					/>

					<button id='theme-toggle' onClick={this.themeToggle}>{this.state.theme == 'light' ? 'Dark theme' : 'Light theme'}</button>

					<MessageList messages={this.state.messages} />
					<MessageForm 
						submitMessage={this.handleSubmitMessage}
						user={this.state.name}
					/>

				</div>
			);
		
		} else {
		
			return (
				<InitForm initUser={this.initializeUser} theme={this.state.theme} />
			);

		}
	}
}

ReactDOM.render(<ChatApp />, document.getElementById('root'));