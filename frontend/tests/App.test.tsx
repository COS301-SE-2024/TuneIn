import React from 'react';
import renderer from 'react-test-renderer';
import App from '../app/index'; // Adjust the path as necessary to point to your index.tsx

describe('<App />', () => {
  it('renders the Home component correctly', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Home component has 3 children', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree.children.length).toBe(3);
  });
});
