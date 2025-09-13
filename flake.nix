{
  description = "MrGo: A Serverless URL Shortener";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    services-flake.url = "github:juspay/services-flake";
  };
  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      imports = [
        inputs.process-compose-flake.flakeModule
      ];
      perSystem =
        { self', pkgs, ... }:
        {
          packages.mrgo = import ./nix/mrgo.nix { inherit pkgs; };
          packages.mrgo-dev = import ./nix/mrgo.nix {
            inherit pkgs;
            dev = true;
          };
          packages.lambda = import ./packages/lambda { inherit pkgs; };
          devShells.default = pkgs.mkShell {
            packages = [
              (pkgs.writeShellScriptBin "lint" "./scripts/dev/lint.sh")
              (pkgs.writeShellScriptBin "format" "./scripts/dev/format.sh")
              pkgs.nodejs_22
              pkgs.awscli2
              pkgs.aws-sam-cli
              pkgs.jq
              pkgs.yq
              pkgs.shellcheck
              pkgs.zip
            ];
          };
        };
    };
}
