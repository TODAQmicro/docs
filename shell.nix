let
  pkgs = import <nixpkgs> {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.awscli2
    pkgs.httpie
    pkgs.jq
    pkgs.nodejs_24
    pkgs.typescript
    pkgs.wget
  ];
}
