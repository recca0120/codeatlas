import * as THREE from "three";
import type { BarUserData } from "./skyline";

export interface TooltipData {
  username: string;
  avatarUrl: string;
  value: number;
  rank: number;
  x: number;
  y: number;
}

export function createInteractionManager(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  interactiveGroup: THREE.Group,
  onHover: (data: TooltipData | null) => void,
  onClick: (username: string) => void,
) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoveredMesh: THREE.Mesh | null = null;
  let pointerDownPos = { x: 0, y: 0 };

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerMove(event: PointerEvent) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveGroup.children);

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const userData = mesh.userData as BarUserData;

      if (hoveredMesh !== mesh) {
        if (hoveredMesh) {
          (hoveredMesh.material as THREE.MeshStandardMaterial).emissive.setHex(
            0x000000,
          );
        }
        hoveredMesh = mesh;
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x333333);
        renderer.domElement.style.cursor = "pointer";
      }

      onHover({
        username: userData.user.login,
        avatarUrl: userData.user.avatarUrl,
        value: userData.user.publicContributions,
        rank: userData.rank + 1,
        x: event.clientX,
        y: event.clientY,
      });
    } else {
      if (hoveredMesh) {
        (hoveredMesh.material as THREE.MeshStandardMaterial).emissive.setHex(
          0x000000,
        );
        hoveredMesh = null;
        renderer.domElement.style.cursor = "default";
        onHover(null);
      }
    }
  }

  function onPointerDown(event: PointerEvent) {
    pointerDownPos = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent) {
    const dx = event.clientX - pointerDownPos.x;
    const dy = event.clientY - pointerDownPos.y;
    if (Math.sqrt(dx * dx + dy * dy) > 3) return; // was a drag

    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveGroup.children);

    if (intersects.length > 0) {
      const userData = intersects[0].object.userData as BarUserData;
      onClick(userData.user.login);
    }
  }

  const el = renderer.domElement;
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", onPointerUp);

  return {
    dispose() {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
    },
  };
}
