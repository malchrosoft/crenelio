#!/usr/bin/env python3
"""
Crénelio - Arrêt complet multiplateforme (Windows, macOS, Linux).
- Arrête les conteneurs Docker
- Ferme d'éventuels processus écoutant sur les ports 5173 (Vite) ou 8000 (API)
"""

import os
import socket
import shutil
import subprocess
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT_DIR)

def print_step(msg: str):
    print(f"\n🛑 {msg}", flush=True)

def print_ok(msg: str):
    print(f"✅ {msg}", flush=True)

def stop_docker():
    print_step("Arrêt des conteneurs Docker...")
    if shutil.which("docker") is None:
        print("Note : commande `docker` introuvable, aucun conteneur à arrêter.")
        return
    cmd = ["docker", "compose", "stop"]
    res = subprocess.run(cmd)
    if res.returncode == 0:
        print_ok("Conteneurs Docker arrêtés.")
    else:
        print("Note : Docker n'a pas pu arrêter certains conteneurs (ou n'est pas actif).")

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def kill_port_process(port: int):
    if not is_port_in_use(port):
        return

    print(f"🧹 Libération du port {port}...")
    if sys.platform == "win32":
        # Windows : netstat + taskkill
        try:
            cmd = f'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :{port}\') do taskkill /f /pid %a'
            subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    else:
        # Unix (macOS / Linux)
        try:
            pid_cmd = ["lsof", "-ti", f":{port}"]
            res = subprocess.run(pid_cmd, stdout=subprocess.PIPE, text=True)
            pids = res.stdout.strip().split()
            for pid in pids:
                if pid:
                    subprocess.run(["kill", "-15", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

def main():
    print("=" * 55)
    print(" Crénelio - Arrêt complet des services")
    print("=" * 55)
    stop_docker()
    kill_port_process(5173)
    print("\n" + "=" * 55)
    print_ok("Tous les services sont arrêtés.")
    print("=" * 55)

if __name__ == "__main__":
    main()
