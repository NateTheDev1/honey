import honey from 'honey';

const App = () => {
    return <div>Hello from Honey Test App</div>;
};

honey.render(<p>Hello World</p>, document.getElementById('root'));
