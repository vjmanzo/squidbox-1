declare module "arduino-create-agent-js-client" {
  export type SerialDevice = {
    Name: string;
    IsOpen: boolean;
  };

  export type NetworkDevice = {
    Name: string;
    IsOpen: boolean;
  };
}
