import React, { useState } from 'react';
import { AdvancedMarker, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { Info, MapPin, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { FOOD_SHOPS } from '../data/seedData';
import { submitSupplyReservation } from '../lib/supabaseClient';
import { CartItem, FoodShop, SupplyProduct, UserProfile } from '../types/pawpath';

interface FoodShopsViewProps {
  user: UserProfile | null;
  cart: CartItem[];
  onAddToCart: (product: SupplyProduct) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onToast: (msg: string) => void;
}

export const FoodShopsView: React.FC<FoodShopsViewProps> = ({
  user,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onToast,
}) => {
  const [selectedShop, setSelectedShop] = useState<FoodShop>(FOOD_SHOPS[0]);
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Dog' | 'Cat'>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user ? `${user.barangay}, ${user.district}, Manila` : ''
  );

  const totalPhp = cart.reduce((sum, item) => sum + item.product.pricePhp * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !deliveryAddress.trim()) return;
    await submitSupplyReservation(
      customerName.trim(),
      deliveryAddress.trim(),
      cart,
      totalPhp
    );
    onClearCart();
    setCartOpen(false);
    onToast('Supply reservation confirmed! Partner shop will prepare your order.');
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] pb-20 lg:pb-0">
      {/* Left Directory + Catalog */}
      <div className="w-full lg:w-[460px] shrink-0 bg-white border-r border-black/[0.06] overflow-y-auto lg:h-[calc(100vh-64px)]">
        <div className="p-5 border-b border-black/[0.06] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">
                Animal Food &amp; Nutrition Directory
              </h1>
              <p className="text-xs text-[#5A635C] mt-1">
                Manila supply stores, species/age diet guides, and supply-only reservations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative h-10 px-3.5 rounded-full bg-[#2D5A3C] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({totalCount})</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F8F4] text-[11px] text-[#414942] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2D5A3C] shrink-0" />
            <span>
              <strong>Supply-Only Policy:</strong> Reservations cover pet food and supplies only.
              No live animal delivery is permitted.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'Dog', 'Cat'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpeciesFilter(sp)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  speciesFilter === sp
                    ? 'bg-[#2D5A3C] text-white'
                    : 'bg-[#F7F8F4] text-[#414942]'
                }`}
              >
                {sp === 'All' ? 'All Species' : `${sp} Nutrition`}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {FOOD_SHOPS.map((shop) => {
            const visibleCatalog = shop.catalog.filter(
              (item) =>
                speciesFilter === 'All' ||
                item.species === speciesFilter ||
                item.species === 'Both'
            );
            const isSelected = selectedShop.id === shop.id;

            return (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`p-5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#F7F8F4]' : 'hover:bg-[#FCF9F8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-[#1A1A1A]">{shop.name}</h2>
                  <span className="text-[11px] font-semibold text-[#2D5A3C]">{shop.district}</span>
                </div>
                <p className="text-xs text-[#5A635C] mt-0.5">{shop.address}</p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {shop.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#F0EDED] text-[10px] font-semibold text-[#414942]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Species/Age Diet Guide */}
                <p className="mt-2.5 text-xs text-[#414942] bg-white p-2.5 rounded-xl border border-[#E2E4DE]">
                  <strong className="text-[#2D5A3C]">Diet Guide:</strong> {shop.dietGuide}
                </p>

                {/* Catalog */}
                <div className="mt-3 space-y-2">
                  {visibleCatalog.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#E2E4DE]"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1A1A1A] truncate">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-[#5A635C]">
                          {prod.lifeStage} · {prod.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-[#2D5A3C] tabular-nums">
                          ₱{prod.pricePhp.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(prod);
                          }}
                          className="h-8 px-2.5 rounded-lg bg-[#2D5A3C] hover:bg-[#21432C] text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Google Map */}
      <div className="flex-1 min-h-[420px] lg:h-[calc(100vh-64px)]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          center={{ lat: selectedShop.lat, lng: selectedShop.lng }}
          defaultZoom={13}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%', minHeight: '420px' }}
        >
          {FOOD_SHOPS.map((shop) => (
            <AdvancedMarker
              key={shop.id}
              position={{ lat: shop.lat, lng: shop.lng }}
              onClick={() => setSelectedShop(shop)}
              title={shop.name}
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border-2 cursor-pointer ${
                  selectedShop.id === shop.id
                    ? 'bg-[#2D5A3C] text-white border-white scale-110'
                    : 'bg-white text-[#144226] border-[#2D5A3C]/40'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{shop.name.split('—')[0].trim()}</span>
              </div>
            </AdvancedMarker>
          ))}
        </GoogleMap>
      </div>

      {/* Supply-Only Reservation Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <h3 className="font-display text-xl font-bold text-[#1A1A1A]">
                  Supply Reservation Cart
                </h3>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#F7F8F4] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-[#5A635C] py-12 text-center">
                  Your supply cart is empty. Add pet food or essentials from any Manila partner
                  shop.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8F4]"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-[#5A635C]">
                          Qty: {item.quantity} · ₱{item.product.pricePhp.toLocaleString()} each
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="w-8 h-8 rounded-lg text-[#A50E0E] hover:bg-[#FCE8E6] flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="pt-4 border-t border-black/[0.06] space-y-3">
                <div className="flex items-center justify-between text-base font-bold text-[#1A1A1A]">
                  <span>Total</span>
                  <span className="tabular-nums text-[#2D5A3C]">
                    ₱{totalPhp.toLocaleString()}
                  </span>
                </div>

                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-xs"
                />
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Metro Manila Delivery / Pickup Barangay"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-xs"
                />

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm"
                >
                  Confirm Supply Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
