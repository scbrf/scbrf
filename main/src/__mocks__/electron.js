module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: {
    on: jest.fn(),
    getPath: jest.fn(),
  },
  remote: jest.fn(),
  dialog: jest.fn(),
  ipcMain: {
    on: jest.fn(),
  },
}
