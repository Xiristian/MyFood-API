output "adls_name" {
  description = "Name of the created storage account"
  value       = azurerm_storage_account.storage.name
}

output "adls_dfs_endpoint" {
  description = "Primary DFS endpoint of the created storage account"
  value       = azurerm_storage_account.storage.primary_dfs_endpoint
}

output "adls_container_landing_zone" {
  description = "Name of the created storage container landing-zone"
  value       = azurerm_storage_container.landing-zone.name
}
