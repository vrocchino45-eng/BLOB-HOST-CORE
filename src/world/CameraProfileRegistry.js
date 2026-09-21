import { AuthoredRegistry } from "./AuthoredRegistry.js";

export class CameraProfileRegistry extends AuthoredRegistry {
  constructor(entries) {
    super({ id: "CameraProfileRegistry", entries });
  }
}
