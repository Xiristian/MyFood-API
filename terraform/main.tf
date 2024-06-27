resource "azurerm_storage_account" "storage" {
  name                     = "datalakemyfood"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled           = true


  blob_properties {

    delete_retention_policy {
      days = 7
    }
    container_delete_retention_policy {
      days = 7
    }
  }
}

resource "azurerm_storage_container" "landing-zone" {
  name                  = "landing-zone"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "container"
}
