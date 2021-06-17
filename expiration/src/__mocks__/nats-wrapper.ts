export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback()
        }
      ),
  },
}

/*
jest.fn() simply means a mock js function. If we need to invoke it and have some kind of implementation we can chain on method to it. This method depends on what we want to execute. 
* For a natswrapper, we needed a client object which should have a publish method which takes in 3 args and calls that cb function provided
In our test case, we can check whether this cb is called or not.
*/
