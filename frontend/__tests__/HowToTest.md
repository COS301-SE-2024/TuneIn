# How To Test:
## Imports
```ts
import React from "react";
import { render } from "@testing-library/react-native";
import Page from "../app/screens/pathToPage";
import functions or modules to mock
// import any other relevant imports
```

## Writing Tests
```ts
describe("Test Group", () => {
   it("a test", () => {
       //Example getter functions are getByText and getByTestId, you can find more in the jest docs
       const { getterFunctions } = render{<Page />};
   })


   //check for rendered text
   expect(getByText("John Doe")).toBeTruthy();


   //check for rendered Component
   //you must add testID="id" to the component in question
   //e.g. <View style={{ paddingHorizontal: 20, paddingTop: 10 }} testID="fav-rooms">
   //More complex assertions can be found in jest docs
   expect(getByTestId("id")).toBeTruthy();


   //This is how you simulate a button press
   const touchableOpacity = getByTestId("links-touchable");
   fireEvent.press(touchableOpacity);


   //snapshot testing allows you to have a copy of the rendered UI code and compare it to the test render
   //requires: import renderer from 'react-test-renderer';
   //First run will create snapshot, afterwards it will compare future runs to it
   const tree = renderer.create(<Page />).toJSON();
   expect(tree).toMatchSnapshot();
});
```

## Running Tests
* npm run test pathToTest
* npm run test:cov (for coverage)

## Mocking
https://jestjs.io/docs/mock-functions 

Mocks are done after imports and before describe/it clause

Some mocks may require you to import the module or file that is being mocked
If you get uri issues add the following mocks (no imports needed):

```ts
jest.mock("expo-font", () => ({
   ...jest.requireActual("expo-font"),
   loadAsync: jest.fn(),
}));


jest.mock("expo-asset", () => ({
   ...jest.requireActual("expo-asset"),
   fromModule: jest.fn(() => ({
       downloadAsync: jest.fn(),
       uri: "mock-uri",
   })),
}));
```
Functionality that needs mocking if being used on relevant page/component:
* Axios: `jest.mock("axios");`

* Inside your it clauses before render: 
`(axios.get as jest.Mock)ockResolvedValueOnce(/*Expected API Response*/);`

* Expo-router:
```ts
jest.mock("expo-router", () => {
   const actualModule = jest.requireActual("expo-router");
   return {
       ...actualModule,
       useNavigation: jest.fn(),
       useLocalSearchParams: jest.fn().mockReturnValue(/*Expected Response*/),
   };
});
```

  * Inside it clause before render:

```ts
const goBack = jest.fn();
       (useNavigation as jest.Mock).mockReturnValue({ goBack });
       (useLocalSearchParams as jest.Mock).mockReturnValue({
           profile: JSON.stringify(mockProfileInfo),
       });
```
* Look at EditProfile.test and CreateRoom.test for examples
AuthManagement:
```ts
jest.mock("../app/services/AuthManagement", () => ({
   __esModule: true,
   default: {
       getToken: jest.fn(), // Mock getToken method
   },
}));
```

Resources: https://jestjs.io/docs/getting-started 